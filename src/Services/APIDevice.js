import axios from '../Setup/Axios'

const fetchAllProtocol = () => {
    return axios.get(`/api/v1/protocol/get-protocol`)
}

const fetchAllDataFormat = () => {
    return axios.get(`/api/v1/channels/get-channels/data-format`)
}

const fetchAllDataType = () => {
    return axios.get(`/api/v1/channels/get-channels/data-type`)
}

const fetchAllFunctionCode = () => {
    return axios.get(`/api/v1/channels/get-channels/function-code`)
}

/* API Devices */
const fetchAllDevices = () => {
    return axios.get(`/api/v1/devices/get-device`)
}
const createNewDevice = (deviceNew) => {
    return axios.post(`/api/v1/devices/create-device`, { ...deviceNew })
}
const deleteDevice = (deviceDelete) => {
    return axios.delete(`/api/v1/devices/delete-device`, { data: deviceDelete });
}
const updateCurrentDevice = (deviceUpdate) => {
    return axios.put(`/api/v1/devices/update-device`, { ...deviceUpdate })
}

/* API Coms */
const fetchAllComs = () => {
    return axios.get(`/api/v1/coms/get-coms`)
}
const updateCurrentCom = (comUpdate) => {
    return axios.put(`/api/v1/coms/update-com`, { ...comUpdate })
}

/* API Channels */
const fetchAllChannels = () => {
    return axios.get(`/api/v1/channels/get-channels`)
}

const createNewChannel = (channelNew) => {
    return axios.post(`/api/v1/channels/create-channel`, { ...channelNew })
}

const updateCurrentChannel = (channelUpdate) => {
    return axios.put(`/api/v1/channels/update-channel`, { ...channelUpdate })
}

const deleteChannel = (deleteChannel) => {
    return axios.delete(`/api/v1/channels/delete-channel`, { data: deleteChannel });
}

/* API Historical */
const fetchAllHistorical = () => {
    return axios.get(`/api/v1/historical/get-taghistorical`)
}

const createNewHistorical = (historicalNew) => {
    return axios.post(`/api/v1/historical/create-taghistorical`, historicalNew)
}

const deleteHistorical = (dataDelete) => {
    return axios.delete(`/api/v1/historical/delete-taghistorical`, {
        data: dataDelete
    });
};

const fetchConfigHistorical = () => {
    return axios.get(`/api/v1/historical/get-config`)
}

const updateConfigHistorical = (historicalConfig) => {
    return axios.put(`/api/v1//historical/update-config`, historicalConfig)
}

/* API Historical Value */
const fetchAllHistoricalValue = () => {
    return axios.get(`/api/v1/historical/get-listdata`)
}

const findHistoricalTime = (dateTime) => {
    return axios.post(`/api/v1/historical/get-listdata-time`, dateTime)
}

/* API Alarm */
const fetchAllTagAlarm = () => {
    return axios.get(`/api/v1/alarm/get-tagalram`)
}

const createNewAlarm = (alarmNew) => {
    return axios.post(`/api/v1/alarm/create-tagalram`, alarmNew)
}

const updateTagAlarm = (tagAlarm) => {
    return axios.put(`/api/v1/alarm/update-tagalram`, tagAlarm)
}

const deleteTagAlarm = (dataDelete) => {
    return axios.delete(`/api/v1/alarm/delete-tagalarm`, {
        data: dataDelete
    });
};

const fetchAllApp = () => {
    return axios.get(`/api/v1/alarm/get-app`)
}

const createNewApp = (appNew) => {
    return axios.post(`/api/v1/alarm/create-app`, appNew)
}

const updateApp = (app) => {
    return axios.put(`/api/v1/alarm/update-app`, app)
}

/* API Alarm Value */
const fetchAllAlarmValue = () => {
    return axios.get(`/api/v1/alarm/get-listdata`)
}

const findAlarmTime = (dateTime) => {
    return axios.post(`/api/v1/alarm/get-listdata-time`, dateTime)
}

export {
    fetchAllProtocol,
    fetchAllDevices, createNewDevice, deleteDevice, updateCurrentDevice,
    fetchAllComs, updateCurrentCom,
    fetchAllChannels, createNewChannel, updateCurrentChannel, deleteChannel, fetchAllDataFormat, fetchAllDataType, fetchAllFunctionCode,
    fetchAllHistorical, fetchConfigHistorical, createNewHistorical, updateConfigHistorical, deleteHistorical,
    fetchAllHistoricalValue, findHistoricalTime, fetchAllAlarmValue, findAlarmTime,
    fetchAllTagAlarm, createNewAlarm, updateTagAlarm, deleteTagAlarm, fetchAllApp, createNewApp, updateApp
}