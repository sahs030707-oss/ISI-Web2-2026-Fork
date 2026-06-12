import HttpService from "../../../shared/services/http.service.js";
import CardRequest from "./card.request.js";
import {CardResponse} from "./card.response.js";

export default class CardsService extends HttpService {
    getEndpoint(teamId) {
        return `/teams/${teamId}/cards`;
    }

    async getByTeam(teamId) {
        const json = await super.get(this.getEndpoint(teamId));
        if(!Array.isArray(json)) return[];
        return json.map(item => CardResponse.fromJson(item));
    }

    async create(teamId, cardRequest) {
        if (!(cardRequest instanceof CardRequest)) throw new Error("Request inválido.");
        const json = await super.post(this.getEndpoint(teamId), cardRequest.toJson());
        return CardResponse.fromJson(json);
    }

    async update(teamId, cardId, cardRequest, etag) {
        if (!(cardRequest instanceof CardRequest)) throw new Error("equest inválido.");
        const headers = {"Content-Type": "application/json", "If-Match": etag};
        if(token && token.isValid()) headers["Authorization"] = `Bearer ${token.token}`;
        const response = await fetch(`${this.baseUrl}/teams/${teamId}/cards/${cardId}`, {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify(cardRequest.toJson())
        });
 
        if (response.status === 412) throw new Error("La card fue modificada por otro usuario. Recargá la lista.");
        if (!response.ok) throw new Error("Error al actualizar la card.");
        return CardResponse.fromJson(await response.json());
    }
    
    async remove(teamId, cardId) {
        await super.delete(`${this.getEndpoint(teamId)}/${cardId}`);
    }
}