import axios from 'axios';
import lobby from '../assets/cigarLounge.jpg';
import { useNavigate } from 'react-router-dom';


const Lobby = () => {
    const moveTo = useNavigate();

    const getSession = async() => {
        try {
            const res = await axios.get('http://localhost:3000/lobby', {withCredentials: true});
            if (res.data.authenticated) {
                return;
            }            
            
        } catch (err) {
            console.log(err);
            moveTo('/');
        }         
    }
    getSession();
    
    return(
        <div className="container-fluid p-0">
            <div className="position-relative" style={{height: '100vh'}}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                    backgroundImage: `url(${lobby})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}/>
                <div className='position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50'/>

                <div className="position-relative pt-4" style={{zIndex: 2}}>
                    //content
                    <div className="d-flex justify-content-center pb-5">
                        <h1 className="text-light">
                            Lobby
                        </h1>
                    </div>

                    <div className="container-fluid d-flex justify-content-evenly align-items-center  m-0" style={{ height: '65vh'
                    }}>

                        <div className="card border-success bg-success bg-opacity-25 h-50 w-25">
                            <div className="card-body text-success position-absolute start-50 top-50 translate-middle">
                                <h2 className="card-title text-center">Join a Room</h2>
                            </div>
                        </div>

                        <div className="card border-primary bg-primary bg-opacity-25 h-50 w-25">
                            <div className="card-body text-primary position-absolute start-50 top-50 translate-middle">
                                <h2 className="card-title text-center">Create a Room</h2>
                            </div>
                        </div>

                        <div className="card border-warning bg-warning bg-opacity-25 h-50 w-25">
                            <div className="card-body text-warning position-absolute start-50 top-50 translate-middle">
                                <h2 className="card-title text-center">Shop</h2>
                            </div>
                        </div>

                    </div>
                </div>


            </div>
        </div>
    )

}

export default Lobby;