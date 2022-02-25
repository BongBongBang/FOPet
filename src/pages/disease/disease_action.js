import {diseaseConstants} from "../../constants";

function setDiseaseAttrValue(payload) {
  return {
    type: diseaseConstants["SET_DISEASE_ATTR_VALUE"],
    payload
  };
}

export {
  setDiseaseAttrValue
}
