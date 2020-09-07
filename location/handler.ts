import { Handler, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Client, AddressType } from "@googlemaps/google-maps-services-js";
import { GeocodeResponseData, GeocodeResponse } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import { LocationResponseData } from './types';

const CACHE: Map<string, GeocodeResponseData> = new Map<string, GeocodeResponseData>();
const GEOCODE_CLIENT = new Client({});

const geocodeAddress = async (address: string): Promise<LocationResponseData | undefined> => {
  const data = CACHE.get(address);
  if (data) {
    return handleGeocodeResults(data);
  }
  return GEOCODE_CLIENT.geocode({
    params: {
      address,
      key: 'AIzaSyCHh4tuphAmtLJoOeBz68YEOjHS_4bC5Bo',
    }
  }).then((response: GeocodeResponse) => {
    CACHE.set(address, response.data);
    return handleGeocodeResults(response.data)
  });
}

const handleGeocodeResults = (data: GeocodeResponseData): LocationResponseData | undefined => {
  if (!data || !data.results || data.results.length === 0) {
    return undefined;
  }
  const { address_components, geometry, formatted_address } = data.results[0];
  const city = address_components.find(component => component.types.includes(AddressType.locality))?.long_name;
  if (city) {
    const location = {
      address: formatted_address,
      city,
      location: {
        lat: geometry.location.lat,
        lng: geometry.location.lng,
      },
    };
    return location;
  }
  return undefined;
}

export const get: Handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const queryString = event.queryStringParameters || {};
  const location = await geocodeAddress(queryString.address);
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://ballot-dropboxes.s3-website-us-east-1.amazonaws.com',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ location }, null, 2),
  };
  return response;
}