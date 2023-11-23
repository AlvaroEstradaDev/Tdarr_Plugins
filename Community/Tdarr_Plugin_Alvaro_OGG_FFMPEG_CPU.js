module.exports.dependencies = ['import-fresh'];
const details = () => ({
  id: 'Tdarr_Plugin_Alvaro_OGG_FFMPEG_CPU',
  Stage: 'Pre-processing',
  Name: 'Audio Transcode to OGG using CPU and FFMPEG',
  Type: 'Audio',
  Operation: 'Transcode',
  Description: '[Contains built-in filter] Convert an audio file to ogg, retaining ID3 tags, '
      + 'and at original bitrate up to 64k - from type of: "flac,wav,ape,mp3,m4a,wma,opus" ',
  Version: '0.0.1',
  Tags: 'pre-processing,ffmpeg,audio only',
  Inputs: [
    {
      name: 'codecsToInclude',
      type: 'string',
      defaultValue: 'flac,wav,ape,mp3,m4a,wma,opus',
      inputUI: {
        type: 'text',
      },
      tooltip: `Codecs to exclude
               \\nExample:\\n
               flac,wav,ape,mp3,m4a,wma,opus`,
    },
    {
      name: 'bitRateLimit',
      type: 'string',
      defaultValue: '128k',
      inputUI: {
        type: 'text',
      },
      tooltip: `Bit rate limit
               \\nExample:\\n
               64k,128k,320k`,
    },
  ],
});

module.exports.details = details;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (file, librarySettings, inputs, otherArguments) => {
  const lib = require('../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  inputs = lib.loadDefaultValues(inputs, details);

  const { codecsToInclude, bitRateLimit } = inputs;

  const response = {
    // 320K selected over 384k intentionally
    // https://en.m.wikipedia.org/wiki/MPEG-1#Part_3:_Audio
    preset: `, -map_metadata 0 -c:a libvorbis -b:a ${bitRateLimit}`,
    container: '.ogg',
    handbrakeMode: false,
    ffmpegMode: true,
    processFile: false,
    reQueueAfter: true,
  };

  const filterByCodecInclude = lib.filters.filterByCodec(file, 'include', codecsToInclude);
  const filterByCodecExclude = lib.filters.filterByCodec(file, 'exclude', 'ogg');

  response.infoLog += `${filterByCodecInclude.note} ${filterByCodecExclude.note}`;

  if ((filterByCodecInclude.outcome
    && filterByCodecExclude.outcome)
    || file.forceProcessing) {
    response.processFile = true;
    return response;
  }
  return response;
};

module.exports.details = details;
module.exports.plugin = plugin;
