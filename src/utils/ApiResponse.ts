class ApiResponse {
    public statusCode;
    public data;
    public message;


    constructor(statusCode:number, data:any, message:string="Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        // this.success = statusCode < 400
    }
}

export default ApiResponse;