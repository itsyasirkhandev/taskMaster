export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    requestResourceData?: any;
};
  
export class FirestorePermissionError extends Error {
    public context: SecurityRuleContext;

    constructor(context: SecurityRuleContext) {
        const message = `Firestore Permission Denied: You do not have permission to ${context.operation} the document at '${context.path}'.`;
        super(message);
        this.name = 'FirestorePermissionError';
        this.context = context;
        Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }

    toString() {
        return `${this.name}: ${this.message}\nContext: ${JSON.stringify(this.context, null, 2)}`;
    }
}
