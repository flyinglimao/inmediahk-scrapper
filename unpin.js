const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const recursive = require('recursive-fs')
const basePathConverter = require('base-path-converter')

module.exports = async () => {
    const url = `https://api.pinata.cloud/data/pinList?pageLimit=1000`

    const resp = await axios
        .get(url, {
            headers: {
                pinata_api_key: 'bca73f3fce1d986a4a93',
                pinata_secret_api_key: '5b5adbf54a1ee89390c9694d623a873a2a54d042d85ec7aaf8338763fb6d1ab7'
            }
        })
    await Promise.all(resp.data.rows.map(e => {
        console.log(e)
        return axios.delete('https://api.pinata.cloud/pinning/unpin/' + e.ipfs_pin_hash, {
            headers: {
                pinata_api_key: 'bca73f3fce1d986a4a93',
                pinata_secret_api_key: '5b5adbf54a1ee89390c9694d623a873a2a54d042d85ec7aaf8338763fb6d1ab7'
            }
        }).catch(err => console.log(err))
    }))
}