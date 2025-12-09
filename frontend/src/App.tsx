import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react';

interface SalesRecord {
  'Transaction ID': string;
  'Date': string;
  'Customer ID': string;
  'Customer Name': string;
  'Phone Number': string;
  'Gender': string;
  'Age': number;
  'Customer Region': string;
  'Customer Type': string;
  'Product ID': string;
  'Product Name': string;
  'Brand': string;
  'Product Category': string;
  'Tags': string;
  'Quantity': number;
  'Price per Unit': number;
  'Discount Percentage': number;
  'Total Amount': number;
  'Final Amount': number;
  'Payment Method': string;
  'Order Status': string;
  'Delivery Type': string;
  'Store ID': string;
  'Store Location': string;
  'Salesperson ID': string;
  'Employee Name': string;
}

interface FilterOptions {
  customerRegions: string[];
  genders: string[];
  productCategories: string[];
  tags: string[];
  paymentMethods: string[];
  orderStatuses: string[];
  deliveryTypes: string[];
  brands: string[];
}

interface ApiResponse {
  success: boolean;
  data: SalesRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
  statistics?: {
    totalUnits: number;
    totalAmount: number;
    totalDiscount: number;
  };
}

const API_BASE_URL = 'https://tru-estate-assignment-tau.vercel.app/';

interface AgeFilterProps {
  selectedFilters: { ageMin: string; ageMax: string;[key: string]: any };
  handleFilterChange: (filterType: string, value: string) => void;
  clearFilters: () => void;
}

const AgeFilter: React.FC<AgeFilterProps> = ({ selectedFilters, handleFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFiltered = selectedFilters.ageMin || selectedFilters.ageMax;

  const handleAgeInput = (key: 'ageMin' | 'ageMax', value: string) => {
    handleFilterChange(key, value);
  };

  const handleClearAge = () => {
    handleFilterChange('ageMin', '');
    handleFilterChange('ageMax', '');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg transition-colors ${isFiltered ? 'border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}
      >
        <span className="text-sm font-medium text-gray-700">Age Range</span>
        {isFiltered && (
          <span className="px-2 py-0.5 text-xs font-semibold text-white bg-blue-600 rounded-full">
            1
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 p-4 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="ageMin" className="text-xs font-medium text-gray-500 block mb-1">Min Age</label>
                <input
                  id="ageMin"
                  type="number"
                  placeholder="e.g., 18"
                  value={selectedFilters.ageMin}
                  onChange={(e) => handleAgeInput('ageMin', e.target.value)}
                  onBlur={(e) => handleAgeInput('ageMin', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="ageMax" className="text-xs font-medium text-gray-500 block mb-1">Max Age</label>
                <input
                  id="ageMax"
                  type="number"
                  placeholder="e.g., 65"
                  value={selectedFilters.ageMax}
                  onChange={(e) => handleAgeInput('ageMax', e.target.value)}
                  onBlur={(e) => handleAgeInput('ageMax', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {isFiltered && (
                <button
                  onClick={handleClearAge}
                  className="mt-2 text-red-600 text-sm hover:bg-red-50 py-1 rounded-md"
                >
                  Clear Age Filter
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
const App = () => {
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;
  const [statistics, setStatistics] = useState({ totalUnits: 0, totalAmount: 0, totalDiscount: 0 });

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    customerRegions: [],
    genders: [],
    productCategories: [],
    tags: [],
    paymentMethods: [],
    orderStatuses: [],
    deliveryTypes: [],
    brands: []
  });

  const [selectedFilters, setSelectedFilters] = useState({
    customerRegions: [] as string[],
    gender: [] as string[],
    ageMin: '',
    ageMax: '',
    productCategories: [] as string[],
    tags: [] as string[],
    paymentMethods: [] as string[],
    dateFrom: '',
    dateTo: ''
  });

  const [sortBy, setSortBy] = useState('date-newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [searchTerm, selectedFilters, sortBy, currentPage]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/filters`);
      if (!response.ok) {
        console.error('Filter endpoint error:', response.status);
        return;
      }
      const data = await response.json();
      console.log('📊 Filter options received:', data);
      if (data.success && data.data) {
        setFilterOptions({
          customerRegions: data.data.customerRegions || [],
          genders: data.data.genders || [],
          productCategories: data.data.productCategories || [],
          tags: data.data.tags || [],
          paymentMethods: data.data.paymentMethods || [],
          orderStatuses: data.data.orderStatuses || [],
          deliveryTypes: data.data.deliveryTypes || [],
          brands: data.data.brands || []
        });
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (selectedFilters.customerRegions.length) params.append('customerRegion', selectedFilters.customerRegions.join(','));
      if (selectedFilters.gender.length) params.append('gender', selectedFilters.gender.join(','));
      if (selectedFilters.ageMin) params.append('ageMin', selectedFilters.ageMin);
      if (selectedFilters.ageMax) params.append('ageMax', selectedFilters.ageMax);
      if (selectedFilters.productCategories.length) params.append('productCategory', selectedFilters.productCategories.join(','));
      if (selectedFilters.tags.length) params.append('tags', selectedFilters.tags.join(','));
      if (selectedFilters.paymentMethods.length) params.append('paymentMethod', selectedFilters.paymentMethods.join(','));
      if (selectedFilters.dateFrom) params.append('dateFrom', selectedFilters.dateFrom);
      if (selectedFilters.dateTo) params.append('dateTo', selectedFilters.dateTo);

      params.append('sort', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());

      const response = await fetch(`${API_BASE_URL}/api/sales?${params.toString()}`);

      if (!response.ok) {
        console.error('API error:', response.status);
        setSalesData([]);
        return;
      }

      const data: ApiResponse = await response.json();
      console.log('📊 Sales data received:', {
        recordCount: data.data?.length,
        pagination: data.pagination,
        firstRecord: data.data?.[0]
      });

      if (data.success) {
        setSalesData(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.totalRecords || 0);

        const totalUnits = data.data?.reduce((sum, record) => sum + (record.Quantity || 0), 0) || 0;
        const totalAmount = data.data?.reduce((sum, record) => sum + (record['Total Amount'] || 0), 0) || 0;
        const totalDiscount = data.data?.reduce((sum, record) => sum + ((record['Total Amount'] || 0) - (record['Final Amount'] || 0)), 0) || 0;

        setStatistics({
          totalUnits,
          totalAmount,
          totalDiscount
        });
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => {
      if (['customerRegions', 'gender', 'productCategories', 'tags', 'paymentMethods'].includes(filterType)) {
        const currentValues = prev[filterType as keyof typeof prev];
        if (Array.isArray(currentValues)) {
          const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
          return { ...prev, [filterType]: newValues };
        }
      }
      return { ...prev, [filterType]: value };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedFilters({
      customerRegions: [],
      gender: [],
      ageMin: '',
      ageMax: '',
      productCategories: [],
      tags: [],
      paymentMethods: [],
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedFilters.customerRegions.length) count++;
    if (selectedFilters.gender.length) count++;
    if (selectedFilters.ageMin || selectedFilters.ageMax) count++;
    if (selectedFilters.productCategories.length) count++;
    if (selectedFilters.tags.length) count++;
    if (selectedFilters.paymentMethods.length) count++;
    if (selectedFilters.dateFrom || selectedFilters.dateTo) count++;
    return count;
  }, [selectedFilters]);

  const FilterDropdown = ({ title, options, filterKey }: { title: string; options: string[]; filterKey: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedValues = selectedFilters[filterKey as keyof typeof selectedFilters];
    const count = Array.isArray(selectedValues) ? selectedValues.length : 0;

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">{title}</span>
          {count > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold text-white bg-blue-600 rounded-full">
              {count}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
              <div className="p-2">
                {options.map(option => (
                  <label key={option} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Array.isArray(selectedValues) && selectedValues.includes(option)}
                      onChange={() => handleFilterChange(filterKey, option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const getDisplayTransactionId = (index: number) => {
    return ((currentPage - 1) * pageSize) + index + 1;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Sales Management System</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Name, Phone no."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-white text-blue-600 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilters && (
              <>
                <FilterDropdown title="Customer Region" options={filterOptions.customerRegions} filterKey="customerRegions" />
                <FilterDropdown title="Gender" options={filterOptions.genders} filterKey="gender" />

                <AgeFilter
                  selectedFilters={selectedFilters}
                  handleFilterChange={handleFilterChange}
                  clearFilters={clearFilters}
                />

                <FilterDropdown title="Product Category" options={filterOptions.productCategories} filterKey="productCategories" />
                <FilterDropdown title="Tags" options={filterOptions.tags} filterKey="tags" />
                <FilterDropdown title="Payment Method" options={filterOptions.paymentMethods} filterKey="paymentMethods" />

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="date-newest">Date (Newest First)</option>
              <option value="date-oldest">Date (Oldest First)</option>
              <option value="quantity-high">Quantity (High to Low)</option>
              <option value="quantity-low">Quantity (Low to High)</option>
              <option value="name-asc">Customer Name (A-Z)</option>
              <option value="name-desc">Customer Name (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-3 gap-6 p-6">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Total units sold</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalUnits}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{statistics.totalAmount.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Total Discount</p>
                <p className="text-2xl font-bold text-gray-900">₹{statistics.totalDiscount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : salesData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96">
              <p className="text-gray-500 text-lg mb-2">No results found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Transcation ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone Number</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Age</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer Region</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {salesData.map((record, index) => (
                      <tr key={`${record['Transaction ID']}-${index}`} className="hover:bg-gray-50 transition-colors">

                        <td className="px-6 py-4 text-sm">
                          {getDisplayTransactionId(index)}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">{record.Date || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record['Customer ID'] || '-'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{record['Customer Name'] || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record['Phone Number'] || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.Gender || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.Age || '-'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{record['Product Category'] || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.Quantity || 0}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹ {(record['Total Amount'] || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record['Customer Region'] || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record['Product ID'] || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record['Employee Name'] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} results
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(6, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 6) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;