import express from "express"

const app= express()
const port =3000
import  {dbconnect}  from "./utils/db.js"
import router from './routes/index.js'
import cookieParser from "cookie-parser"
import cors from 'cors'


app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://nestbuyonline-frontend.vercel.app"
        ], 
        credentials: true, 
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    })
);

app.use(express.json())
app.use(cookieParser())
dbconnect()

app.get('/',(req,res)=>{
    res.send('this is a welcome msg ')
})

app.use('/api',router)

//end point logic
app.all('*', (req, res, next) => {
    res.status(404).json({ message: "Endpoint does not exist" });
});


app.listen(port,()=>{
    console.log(`port listening to http://localhost:${port}`)
})