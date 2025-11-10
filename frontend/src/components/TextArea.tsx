interface fieldProps{
  label:string
  placeholder:string,
  disabled?:boolean
}


function TextAreaField({ label, placeholder, disabled = false }:fieldProps) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <textarea
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className={`border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          disabled ? "bg-gray-100 text-gray-400" : "bg-white"
        }`}
      />
    </div>
  );
}

export default TextAreaField