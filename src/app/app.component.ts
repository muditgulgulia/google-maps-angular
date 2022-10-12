import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { OpenStreetMapProvider, GoogleProvider } from 'leaflet-geosearch';
import { environment } from 'src/environments/environment';
import { NgSelectComponent } from '@ng-select/ng-select';
import { scan, debounce, map, distinctUntilChanged } from 'rxjs/operators';
import { fromEvent, interval } from 'rxjs';

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

  title = 'google-maps';
  provider: GoogleProvider;
  selectedFromLocation: any;
  disabled: boolean = false;
  searchLoading: boolean = false;
  locations: any = [];

  constructor() {
    this.provider = new GoogleProvider({
      apiKey: environment.GOOGLE_MAP_API_KEY,
      language: 'en', // render results in Dutch
      region: 'us',
    });
  }

  async ngOnInit() {}

  ngAfterViewInit(): void {
    const searchInput = this.searchElementRef.searchInput;

    fromEvent(searchInput.nativeElement, 'input')
      .pipe(map((event: Event) => (event.target as HTMLInputElement).value))
      .pipe(
        scan((i) => ++i, 1),
        debounce((i: number) => interval(50 * i))
      )
      .pipe(distinctUntilChanged())
      .subscribe((_) => this.places(searchInput.nativeElement));
  }

  async places(query: any) {
    const result = await this.provider.search({
      query,
    });

    const address = await this.provider.geocoder?.geocode({
      location: {
        lat: result[0].raw.geometry.location.lat(),
        lng: result[0].raw.geometry.location.lng(),
      },
    });

    if (address) {
      const results = address.results;
      for (var i = 0; i < results.length; i++) {
        const locality = getLong(results[i].address_components, 'locality');
        const city = getLong(
          results[i].address_components,
          'administrative_area_level_2'
        );
        const state = getShort(
          results[i].address_components,
          'administrative_area_level_1'
        );
        const postalcode = getShort(
          results[i].address_components,
          'postal_code'
        );

        if (postalcode) {
          const newItem = `${[locality || city || state, state].join(
            ', '
          )} - ${postalcode}`;
          this.locations.indexOf(newItem) === -1
            ? this.locations.push(newItem)
            : null;
        }
      }
    }
  }

  updateFromCity(event: string) {}
}

function getComponent(components: Components, name: string) {
  return components?.filter(
    (component: { types: string[] }) => component.types[0] === name
  )[0];
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
}
