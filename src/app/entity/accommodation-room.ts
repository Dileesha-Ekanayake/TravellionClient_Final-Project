import {RoomType} from "./room-type";
import {RoomFacility} from "./room-facility";
import {AccommodationFacilities} from "./accommodation-facilities";
import {AccommodationOccupanciesPax} from "./accommodation-occupancies-pax";
import {AccommodationRates} from "./accommodation-rates";

export class AccommodationRoom {
  public id!: number;
  public rooms!: number;
  public roomtype!: RoomType;
  public accommodationfacilities!: Array<AccommodationFacilities>;
  public accommodationoccupanciespaxes!: Array<AccommodationOccupanciesPax>
  public accommodationrates!: Array<AccommodationRates>;
}
