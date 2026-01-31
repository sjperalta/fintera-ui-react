import ProtoTypes from "prop-types";


function LoginPromo({ img }) {
  return (
    <div className="">
      <img src={img} alt="" />
    </div>
  );
}

LoginPromo.propTypes = {
  img: ProtoTypes.string,
};

export default LoginPromo;