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
const fetchDevice = () => {
    return axios.get(`/api/v1/device`)
}

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
const fetchTagname = () => {
    return axios.get(`/api/v1/tagname`)
}

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

/* API FTP */
const fetchConfig = () => {
    return axios.get(`/api/v1/configuration`)
}

const fetchAllFTPServer = () => {
    return axios.get(`/api/v1/ftp/get-ftpserver`)
}

const createFTPServer = (tagNew) => {
    return axios.post(`/api/v1/ftp/create-ftpserver`, tagNew)
}

const updateFTPServer = (FTPServer) => {
    return axios.put(`/api/v1/ftp/update-ftpserver`, FTPServer)
}

const deleteFTPServer = (dataDelete) => {
    return axios.delete(`/api/v1/ftp/delete-ftpserver`, {
        data: dataDelete
    });
};

/* API MYSQL */
const testMySQLServer = (mySQLServer) => {
    return axios.post(`/api/v1/mysql/testconnect-mysqlserver`, mySQLServer)
}

const createTableMySQL = (mySQLServer, tags) => {
    return axios.post(`/api/v1/mysql/createtable-mysqlserver`, {
        mySQLServer,
        tags,
    })
}

const fetchAllMySQLServer = () => {
    return axios.get(`/api/v1/mysql/get-mysqlserver`)
}

const createMySQLServer = (mySQLServer) => {
    return axios.post(`/api/v1/mysql/create-mysqlserver`, mySQLServer)
}

const updateMySQLServer = (mySQLServer) => {
    return axios.put(`/api/v1/mysql/update-mysqlserver`, mySQLServer)
}

const deleteMySQLServer = (dataDelete) => {
    return axios.delete(`/api/v1/mysql/delete-mysqlserver`, {
        data: dataDelete
    });
};

/* API SQL */
const testSQLServer = (SQLServer) => {
    return axios.post(`/api/v1/sql/testconnect-sqlserver`, SQLServer)
}

const createTableSQL = (SQLServer, tags) => {
    return axios.post(`/api/v1/sql/createtable-sqlserver`, {
        SQLServer,
        tags,
    })
}

const fetchAllSQLServer = () => {
    return axios.get(`/api/v1/sql/get-sqlserver`)
}

const createSQLServer = (SQLServer) => {
    return axios.post(`/api/v1/sql/create-sqlserver`, SQLServer)
}

const updateSQLServer = (SQLServer) => {
    return axios.put(`/api/v1/sql/update-sqlserver`, SQLServer)
}

const deleteSQLServer = (dataDelete) => {
    return axios.delete(`/api/v1/sql/delete-sqlserver`, {
        data: dataDelete
    });
};

/* API Publish */
const fetchServer = () => {
    return axios.get(`/api/v1/servers`)
}

const fetchAllPublish = () => {
    return axios.get(`/api/v1/publish/get-mqtt`)
}

const createPublish = (tagNew) => {
    return axios.post(`/api/v1/publish/create-mqtt`, tagNew)
}

const updatePublish = (tagedit) => {
    return axios.put(`/api/v1/publish/update-mqtt`, tagedit)
}

const deletePublish = (tagdelete) => {
    return axios.delete(`/api/v1/publish/delete-mqtt`, {
        data: tagdelete
    });
};

const fetchAllConfigPublish = () => {
    return axios.get(`/api/v1/publish/get-config`)
}
const createConfigPublish = (tagNew) => {
    return axios.post(`/api/v1/publish/create-config`, tagNew)
}
const updateConfigPublish = (tagedit) => {
    return axios.put(`/api/v1/publish/update-config`, tagedit)
}

const deleteConfigPublish = (tagdelete) => {
    return axios.delete(`/api/v1/publish/delete-config`, {
        data: tagdelete
    });
};

/* API RTU Server */
const fetchAllRTUServer = () => {
    return axios.get(`/api/v1/server/get-rtu`)
}

const createRTUServer = (tagNew) => {
    return axios.post(`/api/v1/server/create-rtu`, tagNew)
}

const updateRTUServer = (tagedit) => {
    return axios.put(`/api/v1/server/update-rtu`, tagedit)
}

const deleteRTUServer = (tagdelete) => {
    return axios.delete(`/api/v1/server/delete-rtu`, {
        data: tagdelete
    });
};

/* API TCP Server */
const fetchAllTCPServer = () => {
    return axios.get(`/api/v1/server/get-tcp`)
}

const createTCPServer = (tagNew) => {
    return axios.post(`/api/v1/server/create-tcp`, tagNew)
}

const updateTCPServer = (tagedit) => {
    return axios.put(`/api/v1/server/update-tcp`, tagedit)
}

const deleteTCPServer = (tagdelete) => {
    return axios.delete(`/api/v1/server/delete-tcp`, {
        data: tagdelete
    });
};
/* API User */
const fetchUser = () => {
    return axios.get(`/api/v1/user`)
}

const fetchAllUser = () => {
    return axios.get(`/api/v1/user/get-user`)
}

const createUser = (tagNew) => {
    return axios.post(`/api/v1/user/create-user`, tagNew)
}

const updateUser = (tagedit) => {
    return axios.put(`/api/v1/user/update-user`, tagedit)
}

const deleteUser = (tagdelete) => {
    return axios.delete(`/api/v1/user/delete-user`, {
        data: tagdelete
    });
};

const handleLoginWeb = (data) => {
    return axios.post(`/api/v1/login`, data)
}

/* API Setting */
const fetchSetting = () => {
    return axios.get(`/api/v1/setting`)
}

const fetchNetwork = () => {
    return axios.get(`/api/v1/setting/get-network`)
}

const updateNetwork = (data) => {
    return axios.put(`/api/v1/setting/update-network`, data)
}

const rebootDevice = () => {
    return axios.get(`/api/v1/setting/reboot`)
}

const fetchHeader = () => {
    return axios.get(`/api/v1/setting/get-header`)
}

const createHeader = (data) => {
    return axios.post(`/api/v1/setting/create-header`, data)
}

const updateHeader = (data) => {
    return axios.put(`/api/v1/setting/update-header`, data)
}

export {
    fetchAllProtocol,
    fetchAllDevices, createNewDevice, deleteDevice, updateCurrentDevice, fetchDevice,
    fetchAllComs, updateCurrentCom,
    fetchTagname, fetchAllChannels, createNewChannel, updateCurrentChannel, deleteChannel, fetchAllDataFormat, fetchAllDataType, fetchAllFunctionCode,
    fetchAllHistorical, fetchConfigHistorical, createNewHistorical, updateConfigHistorical, deleteHistorical,
    fetchAllHistoricalValue, findHistoricalTime, fetchAllAlarmValue, findAlarmTime,
    fetchAllTagAlarm, createNewAlarm, updateTagAlarm, deleteTagAlarm, fetchAllApp, createNewApp, updateApp,
    fetchConfig, fetchAllFTPServer, createFTPServer, updateFTPServer, deleteFTPServer,
    fetchAllMySQLServer, createMySQLServer, updateMySQLServer, deleteMySQLServer,
    testMySQLServer, createTableMySQL, testSQLServer, createTableSQL,
    fetchAllSQLServer, createSQLServer, updateSQLServer, deleteSQLServer,
    fetchServer, fetchAllPublish, createPublish, updatePublish, deletePublish,
    fetchAllConfigPublish, createConfigPublish, updateConfigPublish, deleteConfigPublish,
    fetchAllRTUServer, createRTUServer, updateRTUServer, deleteRTUServer,
    fetchAllTCPServer, createTCPServer, updateTCPServer, deleteTCPServer,
    fetchAllUser, createUser, updateUser, deleteUser, handleLoginWeb,
    fetchUser, fetchSetting, fetchNetwork, rebootDevice, fetchHeader, createHeader, updateHeader, updateNetwork
}