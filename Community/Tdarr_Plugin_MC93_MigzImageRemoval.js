/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
  id: 'Tdarr_Plugin_MC93_MigzImageRemoval',
  Stage: 'Pre-processing',
  Name: 'Migz Remove Image Formats From File',
  Type: 'Video',
  Operation: 'Transcode',
  Description: 'Identify any unwanted image formats in the file and remove those streams. MJPEG, PNG & GIF \n\n',
  Version: '1.5',
  Tags: 'pre-processing,ffmpeg,video only',
  Inputs: [],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (file, librarySettings, inputs, otherArguments) => {
  const lib = require('../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  inputs = lib.loadDefaultValues(inputs, details);
  const response = {
    processFile: false,
    preset: '',
    handBrakeMode: false,
    container: `.${file.container}`,
    FFmpegMode: true,
    reQueueAfter: true,
    infoLog: '',
  };

  // Check if file is a video. If it isn't then exit plugin.
  if (file.fileMedium !== 'video') {
    response.processFile = false;
    response.infoLog += '☒File is not a video. \n';
    return response;
  }

  // Set up required variables.
  let videoIdx = 0;
  let extraArguments = '';
  let convert = false;

  // Go through each stream in the file.
  for (let i = 0; i < file.ffProbeData.streams.length; i++) {
    // Check if stream is video.
    if (file.ffProbeData.streams[i].codec_type.toLowerCase() === 'video') {
      const stream = file.ffProbeData.streams[i];
      const isImageCodec = stream.codec_name === 'mjpeg'
        || stream.codec_name === 'png'
        || stream.codec_name === 'gif';
      const hasImageTag = (stream.tags && (
        stream.tags.MIMETYPE
        || (stream.tags.FILENAME && stream.tags.FILENAME.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/i))
      ));
      const hasZeroDuration = stream.duration === '0'
        || stream.duration === '0.0'
        || stream.duration === '0.000000000'
        || stream.duration === 0
        || stream.duration === '00:00:00.000000000';
      const isCoverArt = isImageCodec
        || (videoIdx > 0
          && (hasImageTag || (hasZeroDuration && stream.width && stream.width < 500)));
      if (isCoverArt) {
        convert = true;
        extraArguments += `-map -v:${videoIdx} `;
      }
      // Increment videoIdx.
      videoIdx += 1;
    }
  }

  // Convert file if convert variable is set to true.
  if (convert === true) {
    response.preset += `,-map 0 -c copy -max_muxing_queue_size 9999 ${extraArguments}`;
    response.infoLog += '☒File has image format stream, removing. \n';
    response.processFile = true;
  } else {
    response.processFile = false;
    response.infoLog
      += "☑File doesn't contain any unwanted image format streams.\n";
  }
  return response;
};
module.exports.details = details;
module.exports.plugin = plugin;
