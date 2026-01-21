import { Country, mongoose } from '@models';
import { ICountryDoc } from '@schemas';

type FilterQueryICountry = mongoose.FilterQuery<ICountryDoc>;

class CommonDao {
    async getAllCountries(matchCriteria: FilterQueryICountry): Promise<ICountryDoc[]> {
        return Country.find(matchCriteria);
    }
}

export default new CommonDao();
