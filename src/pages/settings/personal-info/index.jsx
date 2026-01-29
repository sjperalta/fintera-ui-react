import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import PersonalInfoForm from "../../../component/forms/PersonalInfoForm";

function PersonalInfo() {
  const { userId } = useParams(); // Extract userId from the route

  return (
    <div id="tab1" className="tab-pane active">
      <div className="xl:grid grid-cols-12 gap-12 flex 2xl:flex-row flex-col-reverse">
        {/* Pass userId as a prop */}
        <PersonalInfoForm userId={userId} />
      </div>
    </div>
  );
}

PersonalInfo.propTypes = {
  userId: PropTypes.string, // Ensure userId is passed as a prop
};

export default PersonalInfo;