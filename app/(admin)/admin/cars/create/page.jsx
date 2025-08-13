import CarForm from "../_components/car-form"

export const metadata = {
    title : "Add new car | Admin",
    description : "Add a new car to the marketplace"
}

export default function AddCarPage(){
    return <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Car</h1>
        <CarForm />
    </div>
}