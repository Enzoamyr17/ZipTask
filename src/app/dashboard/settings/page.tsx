import "../styles.css"

export default function Settings() {
    return (
        <div className="container h-[90.8vh] grid grid-cols-2 gap-4 p-4">
            <div className="col-span-1 bg-primary/10 rounded-md p-4">
                <h1 className="text-xl font-semibold">Accont Settings</h1>
            </div>
            <div className="col-span-1 bg-primary/10 rounded-md p-4">
                <h1 className="text-xl font-semibold">Settings</h1>
            </div>
        </div>
    )
}