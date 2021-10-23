const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const recursive = require('recursive-fs')
const basePathConverter = require('base-path-converter')

require('dotenv').config()

module.exports = () => {
    return new Promise((res, rej) => {
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`
        const src = './working_folder'

        //we gather the files from a local directory in this example, but a valid readStream is all that's needed for each file in the directory.
        recursive.readdirr(src, async function (err, dirs, files) {
            let data = new FormData()
            files.forEach((file) => {
                //for each file stream, we need to include the correct relative file path
                data.append(`file`, fs.createReadStream(file), {
                    filepath: basePathConverter(src, file)
                })
            })
            const resp = await axios
                .post(url, data, {
                    maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large directories
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                        pinata_api_key: process.env.PINATA_KEY,
                        pinata_secret_api_key: process.env.PINATA_SECRET,
                    }
                })
            res(resp.data.IpfsHash)
        });
    })
}