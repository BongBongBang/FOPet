import medicalConsultConstants from '../../constants/medicalConsult';

export function checkAreaList(payload) {
  return {
    type: medicalConsultConstants["CHECK_AREA_LIST"],
    payload
  };
}

export function setMedicalConsultAttrValue(payload) {
  return {
    type: medicalConsultConstants["SET_MEDICAL_CONSULT_ATTR_VALUE"],
    payload
  };
}

