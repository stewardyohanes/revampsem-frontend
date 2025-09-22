import API from "../../networks/api.ts";
import { 
  CreateEventDTO,
  EventDto, 
  CreateEventDto, 
  PresentDto,
  UploadAttendanceDto
} from "./dtos";

export class EventApiService {
  async getEvents(): Promise<EventDto[]> {
    const response = await API.EVENTS.GET_ALL();
    return response.data || [];
  }

  async getEventAttendees(eventId: string): Promise<PresentDto[]> {
    const response = await API.PRESENTS.GET_ALL({ event_id: parseInt(eventId) });
    return response.data || [];
  }

  async insertEvent(dto: CreateEventDTO): Promise<EventDto | undefined> {
    const createData: CreateEventDto = {
      name: dto.name,
      created_by: dto.created_by || 0,
      modified_by: dto.modified_by || 0,
      profit_center: dto.profit_center || 0,
      event_date_from: dto.event_date_from instanceof Date ? dto.event_date_from.toISOString() : dto.event_date_from,
      event_date_to: dto.event_date_to instanceof Date ? dto.event_date_to.toISOString() : dto.event_date_to,
    };
    
    const response = await API.EVENTS.CREATE(createData);
    return response.data;
  }

  async insertAttendance(eventId: string, file: File): Promise<UploadAttendanceDto> {
    return await API.EVENTS.UPLOAD_ATTENDANCE(parseInt(eventId), file);
  }
}
