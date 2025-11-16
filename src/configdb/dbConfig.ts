import mongoose from "mongoose"

export async function connect() {
    try {
        mongoose.connect(process.env.MONGO_URL!)
        const connection = mongoose.connection

        connection.on('connected', () => {
            console.log('MongoDB connect')
        })

        connection.on('error', (err) => {
            console.log('MongoDB connection error', err)
            process.exit()
        })
        console.log('Database connected successfully')
        
    } catch (error) {
        console.log('Something went wrong for Database connection')        
    }
}