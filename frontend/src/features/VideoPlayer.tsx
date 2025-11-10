function VideoPlayer() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8">
      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-500 mb-2">Local Video</p>
        <video
          id="localPlayer"
          autoPlay
          className="rounded-xl shadow-lg w-80 h-60 bg-black"
        />
      </div>
      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-500 mb-2">Remote Video</p>
        <video
          id="peerPlayer"
          autoPlay
          className="rounded-xl shadow-lg w-80 h-60 bg-black"
        />
      </div>
    </div>
  );
}

export default VideoPlayer