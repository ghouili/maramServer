// const { AssemblyAI } = require("assemblyai");

// const client = new AssemblyAI({
//   apiKey: process.env.ASSEMBLYAI_API_KEY,
// });

// const audioUrl =
//   "https://github.com/AssemblyAI-Examples/audio-examples/raw/main/20230607_me_canadian_wildfires.mp3";

// const params = {
//   audio: audioUrl,
//   language_detection: true,
// };

// const Transcribe = async (req, res) => {
//   let transcript = await client.transcripts.transcribe(params);

//   console.log(transcript.status);
//   return res.send(transcript.text);
// };

// // function sleep(ms) {
// //   return new Promise((resolve) => setTimeout(resolve, ms));
// // }

// exports.Transcribe = Transcribe;

// const Readable = require('stream');
const AssemblyAI = require('assemblyai');
// const RealtimeTranscript = require('assemblyai').RealtimeTranscript;
const recorder = require('node-record-lpcm16');

const run = async () => {
  const client = new AssemblyAI({
    apiKey: '57ec6759d5674c099c584a8b11bf86f9' // Replace with your actual API key
  });

  const transcriber = client.realtime.transcriber({
    sampleRate: 16000
  });

  transcriber.on('open', ({ sessionId }) => {
    console.log(`Session opened with ID: ${sessionId}`);
  });

  transcriber.on('error', (error) => {
    console.error('Error:', error);
  });

  transcriber.on('close', (code, reason) =>
    console.log('Session closed:', code, reason)
  );

  transcriber.on('transcript', (transcript) => {
    if (!transcript.text) {
      return;
    }

    if (transcript.message_type === 'PartialTranscript') {
      console.log('Partial:', transcript.text);
    } else {
      console.log('Final:', transcript.text);
    }
  });

  try {
    console.log('Connecting to real-time transcript service');
    await transcriber.connect();

    console.log('Starting recording');
    const recording = recorder.record({
      channels: 1,
      sampleRate: 16000,
      audioType: 'wav' // Linear PCM
    });

    recording.stream().pipe(transcriber.stream());

    // Stop recording and close connection using Ctrl-C.
    process.on('SIGINT', async function () {
      console.log();
      console.log('Stopping recording');
      recording.stop();

      console.log('Closing real-time transcript connection');
      await transcriber.close();

      process.exit();
    });
  } catch (error) {
    console.error(error);
  }
};

run();
