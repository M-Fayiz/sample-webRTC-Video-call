import InputField from "../components/InputField";

function ControlPanel() {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col gap-4 w-full max-w-xs">
      <h2 className="text-lg font-semibold text-gray-800 text-center">
        Call Controls
      </h2>
      <InputField label="User ID" placeholder="Enter your user ID" />
      <InputField label="Channel Name" placeholder="Enter channel name" />
      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all">
        Call
      </button>
      <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all">
        Hangup
      </button>
    </div>
  );
}


export default ControlPanel