import TextAreaField from "../components/TextArea";

function MessagePanel() {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col gap-4 w-full max-w-xs">
      <h2 className="text-lg font-semibold text-gray-800 text-center">
        Messaging
      </h2>
      <TextAreaField label="Send Message" placeholder="Type your message..." />
      <TextAreaField
        label="Received Message"
        placeholder="Incoming messages..."
        disabled
      />
      <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all">
        Send Message
      </button>
    </div>
  );
}


export default MessagePanel