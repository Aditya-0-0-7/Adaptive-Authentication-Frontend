const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const service_sid=process.env.REACT_APP_SERVICE_SID;
const account_sid=process.env.REACT_APP_ACCOUNT_SID;
const auth_token=process.env.REACT_APP_AUTH_TOKEN;

const Base64 = {
  btoa: (input)  => {
    let str = input;
    let output = '';

    for (let block = 0, charCode, i = 0, map = chars;
    str.charAt(i | 0) || (map = '=', i % 1);
    output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

      charCode = str.charCodeAt(i += 3/4);

      if (charCode > 0xFF) {
        throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      
      block = block << 8 | charCode;
    }
    
    return output;
  },

  atob: (input) => {
    let str = input.replace(/=+$/, '');
    let output = '';

    if (str.length % 4 == 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);

      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    return output;
  }
};

const sendSmsVerification =(phoneNumber) => new Promise(async (resolve,reject)=>{
    try {
        const data = {
          "To":phoneNumber,
          "Channel":'sms',
        };
        var formBody = [];
         for (var property in data) {
           var encodedKey = encodeURIComponent(property);
           var encodedValue = encodeURIComponent(data[property]);
           formBody.push(encodedKey + "=" + encodedValue);
         }
         formBody = formBody.join("&");
        const response = await fetch(`https://verify.twilio.com/v2/Services/${service_sid}/Verifications`, {
          method: "POST",
          headers: {
           'Authorization': 'Basic '+Base64.btoa(`${account_sid}:${auth_token}`), 
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formBody,
        });
        if(response.status===201)
        {
           resolve('OTP sent Successfully');
        }
        else
        {
          response.json().then((m)=>{
            console.log(m);
          })
            reject('Error! OTP can not be sent');
        }
      } catch (error) {
        reject('Error! OTP can not be sent');
      }
});

const checkVerification = (phoneNumber, code, flag, userName, modelData)=> new Promise(async (resolve,reject)=>{
    const res=await fetch(`${process.env.REACT_APP_SERVER_URL}/register/verify`, 
      {
          method: "POST",
          mode:'cors',
          body: flag?JSON.stringify({ phone:phoneNumber, code:code, userName:userName, modelData:modelData}):JSON.stringify({ phone:phoneNumber, code:code}),
          headers: {
            "Content-Type": "application/json"
          }
      });
      if(res.status===200)
      {
        if(flag)
        {
          res.json()
          .then(parseRes=>{
            resolve({'msg':'Authentication Successful','token':parseRes.token});
          })
          .catch(error=>{
            reject({'msg':'Some Error occured please try again'});
          });
        }
        else
        {
          resolve({'msg':'Phone Number Verification Successful'});
        }
      }
      else if(res.status===400)
      {
        reject({'msg':'Provided OTP is invalid'});
      }
      else if(res.status===503)
      {
        reject({'msg':'Database Error! Authentication Failed'});
      }
      else
      {
        if(flag)
          reject({'msg':'Server Error! Authentication Failed'});
        else
          reject({'msg':'Server Error! Phone Number Verification Failed'});
      }
});

module.exports = {
 sendSmsVerification,
 checkVerification,
};