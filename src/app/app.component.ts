import { ChangeDetectorRef, Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { ApiService, Maps } from './services/api.service';
import { environment } from 'src/environments/environment';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MapsService } from './services/maps.service';

const place = null as unknown as google.maps.places.PlaceResult;
type Components = typeof place.address_components;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('search')
  public searchElementRef!: NgSelectComponent;

  searchLoading: any;
  locations!: any[];
  addresses!: any[];
  toSearchLoading!: boolean;
  disabled: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private gMapService: MapsService,
    // private snackBar: MatSnackBar
    private apiService: ApiService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const searchInput = this.searchElementRef.searchInput;

    fromEvent(searchInput.nativeElement, 'input')
      .pipe(map((event: Event) => (event.target as HTMLInputElement).value))
      .pipe(
        debounceTime(1000),
      )
      .pipe(distinctUntilChanged())
      .subscribe(_ => this.searchPred(searchInput.nativeElement, 'searchLoading'));
  }

  async searchPred(event: HTMLInputElement, field: string) {

    try {
      if (event.value && !this.searchLoading) {
        if (event.value.replace(/\s+/g, '').length > 2) {
          const val = event.value;
          this.locations = []
          this.addresses = []

          if (field == 'searchLoading')
            this.searchLoading = true
          else
            this.toSearchLoading = true

          this.changeDetectorRef.detectChanges()
          const maps: Maps = await this.apiService.api;

          new maps.Geocoder().geocode({
            address: event.value,
            componentRestrictions: {
              country: 'us'
            }
          }, (res) => {
            if (res) {
              this.setAddress(res, event.value).then((_e) => {
                if (field == 'searchLoading')
                  this.searchLoading = false
                else
                  this.toSearchLoading = false
                event.value = val
                this.locations = array_unique(this.locations)
                this.changeDetectorRef.detectChanges()
              })
            } else {
              if (field == 'searchLoading')
                this.searchLoading = true
              else
                this.toSearchLoading = true
            }
          })
        }
      }
    } catch (e) {
      this.searchLoading = false
      console.log(e);
    }
  }

  async setAddress(res: google.maps.GeocoderResult[], input: string): Promise<any> {
    await this.getLocationDetails(res, input);
    this.changeDetectorRef.detectChanges()
  }

  getLocationDetails(place: google.maps.GeocoderResult[], _input: string): Promise<any> {
    this.addresses = []
    this.locations = []

    const that = this
    return new Promise(async function (resolve, reject) {
      try {
        for (var i = 0; i < place.length; i++) {
          const locality = getLong(place[i].address_components, 'locality')
          const city = getLong(place[i].address_components, 'administrative_area_level_2')
          const state = getShort(place[i].address_components, 'administrative_area_level_1')
          const postalcode = getShort(place[i].address_components, 'postal_code')
          const newAddress = [
            locality,
            city,
            state
          ].filter((element) => (element !== undefined && element !== null))

          if (newAddress.length && postalcode) {
            that.addresses.push(`${newAddress.join(', ')} - ${postalcode}`)
          } else if (!that.addresses.length) {
            await that.ifnotfound(place[i].geometry.location.lat(), place[i].geometry.location.lng(), that)
          }
        }

        that.locations = that.addresses;
        that.changeDetectorRef.detectChanges()
        return resolve(that.addresses)
      } catch (error) {
        return reject(error)
      }
    });
  }

  ifnotfound(lat: number, long: number, that: this): Promise<any> {
    return new Promise(resolve => {
      that.gMapService.getDetailsFromLatLng(`${environment.apiUrl}/reverse/geocodes`, {
        params: {
          lat,
          long
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }).subscribe(
        (data: any) => {
          for (var i = 0; i < data.length; i++) {
            const locality = getLong(data[i].address_components, 'locality')
            const city = getLong(data[i].address_components, 'administrative_area_level_2')
            const state = getShort(data[i].address_components, 'administrative_area_level_1')
            const postalcode = getShort(data[i].address_components, 'postal_code')

            if (locality && city && state && postalcode) {
              that.addresses.push(`${locality}, ${city}, ${state} - ${postalcode}`)
            }
          }
          resolve(array_unique(that.addresses));
          that.changeDetectorRef.detectChanges()
        })
    })
  }

  updateFromCity($event: any) {
    console.log($event);
  }
}


function getComponent(components: Components, name: string) {
  return components?.filter((component: { types: string[]; }) => component.types[0] === name)[0];
}

function getLong(components: Components, name: string) {
  const component = getComponent(components, name);
  return component && component.long_name;
}

function getShort(components: Components, name: string) {
  const component = getComponent(components, name);
  return component && component.short_name;
}

function array_unique(arr: Iterable<any>) {
  return [...new Set(arr)];
};


export enum vehicalTypes {
  sedan = 'Sedan',
  suv = 'SUV / Truck',
  // truck = 'Oversized',
  oversized_vehicle = 'Oversized',
}
