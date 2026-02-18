import ProtoTypes from "prop-types";
function ToggleBtn({ clickHandler, name, icon, active, children }) {
  return (
    <div
      className="relative  h-[52px] w-[52px]  rounded-[12px] border border-success-300 dark:border-darkblack-400 cursor-pointer"
      style={{ position: "relative" }}
    >
      <button
        aria-label="none"
        onClick={() => clickHandler(name)}
        type="button"
        id="store-btn"
        className="w-full h-full flex items-center justify-center absolute"
        style={{ zIndex: 9 }}
      >
        <span
          className={`absolute -right-[5px] -top-[2px] h-3.5 w-3.5 rounded-full border-2 border-white  dark:border-none  ${
            active ? "bg-blue-500" : "bg-bgray-300 dark:bg-bgray-600"
          }`}
        ></span>
        {icon}
        {children}
      </button>
    </div>
  );
}

ToggleBtn.propTypes = {
  clickHandler: ProtoTypes.func,
  name: ProtoTypes.string,
  icon: ProtoTypes.node,
  active: ProtoTypes.bool,
  children: ProtoTypes.node,
};

export default ToggleBtn;
