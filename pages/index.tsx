import Link from 'next/link';
export default function Home(){
    return(
        <div id='home'>
            <div className="flex items-center justify-between">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                    <Link href='/Builder'>Builder </Link>
                </button>
            </div>
            <div className="flex items-center justify-between">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                    <Link href='/Supervisor'>Supervisor </Link>
                </button>
            </div>
            <div className="flex items-center justify-between">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                    <Link href='/SignUp'>sign up </Link>
                </button>
            </div>
        </div>
        
    )
}