'use client';
export default function Contact() {
  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement)?.value || '';
    window.location.href = `mailto:contact@autowebcommerce.fr?subject=Demande AUTOWEB&body=${encodeURIComponent(message)}`;
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-16 text-gray-800">Contactez-nous</h1>
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6">Appelez-nous !</h2>
            <div className="bg-green-600 text-white p-8 rounded-2xl text-center">
              <p className="text-4xl font-black mb-4">06 98 76 54 32</p>
              <a href="https://wa.me/33698765432" className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-xl font-bold">💬 WhatsApp</a>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8 p-6 bg-gray-50 rounded-xl text-center">
              <div><p className="text-sm text-gray-600">Email</p><a href="mailto:contact@autowebcommerce.fr" className="font-bold block">contact@autowebcommerce.fr</a></div>
              <div><p className="text-sm text-gray-600">Web</p><a href="https://souqify.fr" className="font-bold block">souqify.fr</a></div>
            </div>
          </div>
          <form onSubmit={submitForm} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nom complet</label>
              <input name="name" required className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Téléphone</label>
              <input name="phone" type="tel" required className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Budget souhaité</label>
              <select name="budget" className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500">
                <option value="lt2000">&lt;2000€</option>
                <option value="2000-4000">2000-4000€</option>
                <option value="gt4000">&gt;4000€</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea name="message" rows={5} className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500" placeholder="Type de voiture recherchée..."/>
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-xl py-6 rounded-lg font-bold transition-colors">📩 Envoyer ma demande</button>
          </form>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-xl">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2515.496335972989!2d3.0745!3d50.9167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDU1JzM2LjQiTiAzwrAzJzU2LjIiRQ!5e0!3m2!1sfr!2sfr!4v1699999999999" 
            width="100%" 
            height="400" 
            loading="lazy"
            className="rounded-xl"
            style={{border: 0}}
            allowFullScreen
          />
          <p className="text-center mt-4 text-gray-600">2 Allée de la Mannée, 59910 Bondues</p>
        </div>
        <div className="text-center mt-12 p-6 bg-blue-50 rounded-xl">
          <p className="font-bold text-lg mb-2">AUTOWEB COMMERCE</p>
          <p className="text-sm text-gray-600">SAS SIREN 100148469</p>
        </div>
      </div>
    </section>
  );
}
