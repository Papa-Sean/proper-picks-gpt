const AuthInput = ({ label, type, name, value, onChange, error }) => {
    return (
      <div className="mb-4">
        <label className="block text-md font-bold mb-2" htmlFor={name}>
          {label}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`shadow appearance-none border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline`}
        />
        {error && <p className="text-red-500 text-xs italic">{error}</p>}
      </div>
    );
  };
  
  export default AuthInput;