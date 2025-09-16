import axios from "axios";

export const urlAPI= axios.create(
    {
        baseURL : 'http://Flight-booking-system-env.eba-utt8xhke.ap-south-1.elasticbeanstalk.com'
    }              
)
