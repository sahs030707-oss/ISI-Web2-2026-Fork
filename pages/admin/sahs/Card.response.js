export class CardResponse {
    constructor(id, title, description, order, eTag) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.order = order;
        this.eTag = eTag;
    }
 
    static fromJson(json) {
        return new CardResponse(
            json.id,
            json.title,
            json.description,
            json.order,
            json.eTag || ""
        );
    }
}