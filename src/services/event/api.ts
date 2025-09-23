import API from "../../networks/api.ts";
import {
  CreateEventDTO,
  EventDto,
  PresentDto,
  UploadAttendanceDto,
} from "./dtos";

export class EventApiService {
  async getEvents(): Promise<EventDto[]> {
    const response = await API.EVENTS.GET_ALL();
    return response.data || [];
  }

  async getEventAttendees(eventId: string): Promise<PresentDto[]> {
    const response = await API.PRESENTS.GET_ALL({
      event_id: parseInt(eventId),
    });
    return response.data || [];
  }

  async insertEvent(dto: CreateEventDTO): Promise<EventDto | undefined> {
    const response = await API.EVENTS.CREATE(dto);
    return response.data;
  }

  async insertAttendance(
    eventId: string,
    file: File
  ): Promise<UploadAttendanceDto> {
    return await API.EVENTS.UPLOAD_ATTENDANCE(parseInt(eventId), file);
  }
}
