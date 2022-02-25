import medicalConsultConstants from '../../constants/medicalConsult';
export default {
  checkAreaList: payload => {
    return {
      type: medicalConsultConstants["CHECK_AREA_LIST"],
      payload
    };
  },
  updateConsultContent: payload => {
    return {
      type: medicalConsultConstants["UPDATE_CONSULT_CONTENT"],
      payload
    };
  },
  updateAreaList: payload => {
    return {
      type: medicalConsultConstants["UPDATE_AREA_LIST"],
      payload
    };
  },
  setMedicalConsultAttrValue: payload => {
    return {
      type: medicalConsultConstants["SET_MEDICAL_CONSULT_ATTR_VALUE"],
      payload
    };
  }
}
