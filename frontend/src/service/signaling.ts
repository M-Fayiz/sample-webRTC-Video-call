import { error } from "console";

let localStram;

const constraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
  audio: true,
};
const setUpDevice=()=>{
    console.log('set upt device invoked')
    navigator.mediaDevices.getUserMedia(constraints)
    .then((stream)=>{
        
    })
}