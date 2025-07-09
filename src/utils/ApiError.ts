class ApiError extends Error {
    public statusCode;
    public message;
    public errors;
    public stack;
    public success: boolean;
    public data: any; 


    constructor(statusCode:number, message:string="Somthing went wrong", errors = [], stack = ""){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;