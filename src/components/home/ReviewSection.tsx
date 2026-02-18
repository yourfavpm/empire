
import { Star } from 'lucide-react';

const REVIEWS = [
    {
        id: 1,
        user: "Emmanuel O.",
        text: "Transaction was instant. Got my verified WhatsApp number in seconds.",
        rating: 5
    },
    {
        id: 2,
        user: "Sarah K.",
        text: "The support team helped me fund my wallet with crypto easily. Very reliable.",
        rating: 5
    },
    {
        id: 3,
        user: "David A.",
        text: "Best marketplace for digital tools. Everything works as described.",
        rating: 5
    }
];

export function ReviewSection() {
    return (
        <section className="bg-white py-16 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-brand">Latest Reviews</h2>
                    <p className="text-slate-500 text-sm">Real feedback from our verified users.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {REVIEWS.map((review) => (
                        <div key={review.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors">
                            <div className="flex gap-1 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-brand fill-brand" />
                                ))}
                            </div>
                            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                &quot;{review.text}&quot;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-brand">
                                    {review.user.charAt(0)}
                                </div>
                                <span className="text-sm font-bold text-slate-900">{review.user}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
