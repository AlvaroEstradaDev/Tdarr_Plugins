import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = ():IpluginDetails => ({
  name: 'Check Audio Codec',
  description: 'Check if a file has a specific audio codec',
  style: {
    borderColor: 'orange',
  },
  tags: 'audio',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faQuestion',
  inputs: [
    {
      name: 'codec',
      type: 'string',
      defaultValue: 'aac',
      inputUI: {
        type: 'dropdown',
        options: [
          'aac',
          'ac3',
          'eac3',
          'dca',
          'dts',
          'flac',
          'mp2',
          'mp3',
          'opus',
          'truehd',
          'vorbis',
          'wav',
          'wma',
        ],
      },
      tooltip: 'Specify the codec check for',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'File has codec',
    },
    {
      number: 2,
      tooltip: 'File does not have codec',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args:IpluginInputArgs):IpluginOutputArgs => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  let hasCodec = false;

  if (args.inputFileObj.ffProbeData.streams) {
    args.inputFileObj.ffProbeData.streams.forEach((stream) => {
      if (stream.codec_type === 'audio' && stream.codec_name === args.inputs.codec) {
        hasCodec = true;
      }
    });
  }

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: hasCodec ? 1 : 2,
    variables: args.variables,
  };
};
export {
  details,
  plugin,
};
