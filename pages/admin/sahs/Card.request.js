export default class CardRequest {
    title = '';
    description = '';
    order = 0;
 
    constructor(title, description, order) {
        this.title = title;
        this.description = description;
        this.order = order;
    }
 
    toJson() {
        return {
            title: this.title,
            description: this.description,
            order: this.order
        };
    }
}