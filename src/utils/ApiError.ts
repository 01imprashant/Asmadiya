class ApiError extends Error {
    public statusCode;
    public message;
    public success: boolean;
    public data: any; 
    public errors;


    constructor(statusCode:number, message:string="Somthing went wrong",success:boolean = false, data:any = null, errors:string = ''){
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.success = success
        this.data = data
        this.errors = errors
    }
}

export default ApiError;