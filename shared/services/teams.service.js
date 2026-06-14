import TeamRequest from "../models/request/team.request.js";
import { TeamResponse } from "../models/response/team.response.js";
import HttpService from "./http.service.js";

export default class TeamsService extends HttpService {
    endpoint = '/teams';
    async get() {
        const json = await super.get(this.endpoint);
        if (json === null) return [];
        if (!Array.isArray(json)) return [];

        const teams = json.map(json => TeamResponse.fromJson(json));
        return teams;
    }

    async getById(id) {
        const json = await super.get(`${this.endpoint}/${id}`);
        if (json === null) return null;

        const team = TeamResponse.fromJson(json);
        return team;
    }

    async create(teamRequest) {
        if (!teamRequest) throw new Error('Team request is required.');
        if (!(teamRequest instanceof TeamRequest)) throw new Error('Invalid team request.');

        const json = await super.post(this.endpoint, teamRequest.toJson());
        return TeamResponse.fromJson(json);
    }

    async update(id, teamRequest) {
        if (!id) throw new Error('Team ID is required.');
        if (!teamRequest) throw new Error('Team request is required.');
        if (!(teamRequest instanceof TeamRequest)) throw new Error('Invalid team request.');

        const json = await super.put(`${this.endpoint}/${id}`, teamRequest.toJson());
        return TeamResponse.fromJson(json);
    }

    async delete(id) {
        if (!id) throw new Error('Team ID is required.');

        await super.delete(`${this.endpoint}/${id}`);
    }
}