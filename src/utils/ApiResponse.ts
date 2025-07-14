class ApiResponse {
    public statusCode;
    public data;
    public message;


    constructor(statusCode:number, data:any, message:string="Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
    }
}

export default ApiResponse;