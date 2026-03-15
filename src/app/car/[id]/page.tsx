import { Car, cars } from '../../data/cars';
import Link from 'next/link';
import Image from 'next/image';

export async function generateStaticParams() {
  return cars.map(car => ({id: car.id}));
}

export default function CarDetail({ params }: { params: { id: string } }) {
  const car = cars.find(c => c.id === params.id);
  if (!car) return <div>Voiture non trouvée</div>;

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/stock" className="text-green-600 hover:underline mb-8 inline-block">&larr; Retour</Link>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="relative w-full h-96 bg-gray-200 rounded-2xl overflow-hidden">
            <Image src={car.images[0]} alt={car.title} fill className="object-cover"/>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4">{car.title}</h1>
            <p className="text-6xl font-black text-green-600 mb-8">{car.price.toLocaleString()}€</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl"><div className="font-bold text-2xl">{car.year}</div><span>Année</span></div>
              <div className="bg-gray-50 p-4 rounded-xl"><div className="font-bold">{car.km.toLocaleString()}km</div><span>Km</span></div>
              <div className="bg-green-50 p-4 rounded-xl"><div className="font-bold text-green-700">{car.fuel}</div><span>Carburant</span></div>
              <div className="bg-green-50 p-4 rounded-xl"><div className="font-bold text-green-700">{car.gearbox}</div><span>Boîte</span></div>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl mb-8">
              <h3 className="font-bold text-xl mb-4">Description</h3>
              <p>{car.description}</p>
            </div>
            <Link href="/contact" className="block w-full bg-green-600 text-white text-xl py-6 rounded-lg text-center font-bold">🎯 Réservez maintenant</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
