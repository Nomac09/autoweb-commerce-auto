import { cars } from './data/cars';
import Link from 'next/link';

const latestCars = cars.slice(0, 3);

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-32 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Voiture à petit prix<br/><span className="text-4xl md:text-6xl">selon votre budget</span>
          </h1>
          <p className="text-2xl mb-8">Même <span className="font-bold">&lt;2000€</span>.<br/>Dès 4000€ facilités 3/4 fois + <span className="font-bold">garantie 3 mois</span></p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/stock" className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg">Voir le stock complet</Link>
            <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold py-4 px-8 rounded-lg">Contact</Link>
          </div>
        </div>
      </section>
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Nos dernières arrivées</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {latestCars.map((car) => (
              <div key={car.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md p-6 text-center">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden mx-auto mb-4">
                  <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover"/>
                </div>
                <h3 className="font-bold text-xl mb-2">{car.title}</h3>
                <p className="text-3xl font-black text-green-600">{car.price.toLocaleString()}€</p>
                <p className="text-sm text-gray-600 mt-2">{car.year} • {car.km.toLocaleString()}km • {car.fuel}</p>
                <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm mt-4">{car.budgetTag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
