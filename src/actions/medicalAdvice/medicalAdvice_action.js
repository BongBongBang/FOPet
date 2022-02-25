import {medicalAdviceConstants} from "../../constants";

export function setAttrValue(payload) {
  return {
    type: medicalAdviceConstants["SET_MEDICAL_ADVICE_ATTR_VALUE"],
    payload
  };
}
