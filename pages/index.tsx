import Link from 'next/link';
export default function Home(){
    return(
        <div id='home' className="home-container">
    <h1 className="heading">Blockchain Based Fund Management System</h1>

    <div className="login-buttons">
        <div className="login-section">
            <h3 className="login-heading">Builder Login:</h3>
            <button className="login-button"><Link href='/Builder'>Builder</Link></button>
        </div>
        <div className="login-section">
            <h3 className="login-heading">Supervisor Login:</h3>
            <button className="login-button"><Link href='/Supervisor'>Supervisor</Link></button>
        </div>
    </div>

    <div className='details-home'>
        <div className="members-section">
            <br/>
            <br/>
            <br/>
            <h2 className="section-heading">Members:</h2>
            <div className="members-list">
                <div className="member">
                    {/* <img src="krishna.jpg" alt="Rajesh kumar Kona" className="member-image" /> */}
                    <p>Rajesh kumar Kona</p>
                </div>
                <div className="member">
                    {/* <img src="krishna.jpg" alt="Krishna Vamsi" className="member-image" /> */}
                    <p>Krishna Vamsi</p>
                </div>
                <div className="member">
                    {/* <img src="krishna.jpg" alt="Sameer Rithwik Siddabhaktuni" className="member-image" /> */}
                    <p>Sameer Rithwik Siddabhaktuni</p>
                </div>
                <div className="member">
                    {/* <img src="krishna.jpg" alt="Pavan Sree Vathsav (free load)" className="member-image" /> */}
                    <p>Pavan Sree Vathsav </p>
                </div>
            </div>
        </div>
    </div>
</div>

    
        
    )
}