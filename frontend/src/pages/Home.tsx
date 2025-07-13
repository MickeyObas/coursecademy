import { useEffect } from "react";
import api from "../utils/axios";


function Home() {

  useEffect(() => {
    const getProfile = async () => {
      try{
        const response = await api.get('/api/auth/check/');
        console.log(response.data);
      }catch(error: any){
        if(error.response){
          console.error(error.response.data);
        }else{
          console.error("Whoops, something went wrong.");
        }
      }
    };

    getProfile();

  }, [])

  return (
    <div>Home</div>
  )
}

export default Home;