"use client";
import { useState } from 'react';
import { Car, cars } from '../data/cars';
import Link from 'next/link';

export default function Stock() {
  const [filters, setFilters] = useState({budget:'', fuel:'', gearbox:''});

  const filteredCars = cars.filter(car => 
    (!filters.budget || car.budgetTag === filters.budget) &&
    (!filters.fuel || car.fuel === filters.fuel) &&
    (!filters.gearbox || car.gearbox === filters.gearbox)
  );

  return (
    <section className="py-20 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-16 text-gray-800">Tout notre stock</h1>
        <div className="grid md:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
          <select value={filters.budget} onChange={e=>setFilters({...filters, budget:e.target.value})} className="p-3 border rounded-lg">
            <option value="">Tous budgets</option><option value="< 2000 €">&lt; 2000 €</option><option value="2000-4000 €">2000-4000 €</option><option value="≥ 4000 €">≥ 4000 €</option>
          </select>
          <select value={filters.fuel} onChange={e=>setFilters({...filters, fuel:e.target.value})} className="p-3 border rounded-lg">
            <option value="">Tous carburants</option><option value="Essence">Essence</option><option value="Diesel">Diesel</option>
          </select>
          <select value={filters.gearbox} onChange={e=>setFilters({...filters, gearbox:e.target.value})} className="p-3 border rounded-lg">
            <option value="">Toutes boîtes</option><option value="Manuelle">Manuelle</option><option value="Automatique">Automatique</option>
          </select>
        </div>
        {filteredCars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 mb-4">Aucune voiture</p>
            <button onClick={()=>setFilters({budget:'',fuel:'',gearbox:''})} className="bg-green-600 text-white py-3 px-6 rounded-lg">Réinitialiser</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredCars.map((car) => (
              <div key={car.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md p-6">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden mx-auto mb-4">
                  <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover"/>
                </div>
                <h3 className="font-bold text-xl mb-2">{car.title}</h3>
                <p className="text-3xl font-black text-green-600">{car.price.toLocaleString()}€</p>
                <p className="text-sm text-gray-600">{car.year} • {car.km.toLocaleString()}km • {car.fuel}</p>
                <Link href={`/car/${car.id}`} className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg text-center mt-4">Voir détails</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
