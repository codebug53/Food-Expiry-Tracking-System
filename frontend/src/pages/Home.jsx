import React from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle2, Star, MousePointer2, Zap, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white relative">
      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-32 pb-24 md:pt-40 md:pb-32 px-6 flex flex-col items-center text-center overflow-hidden bg-white border-b border-charcoal/10">
        <div className="absolute inset-0 bg-brutal-grid bg-grid-40 opacity-60 pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-charcoal/20 bg-white shadow-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-golden animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-charcoal">Public Beta Live</span>
          </div>
          
          {/* Headline */}
          <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.9] text-charcoal mb-8 tracking-normal">
            Know before you <br/>
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-2 bg-golden -rotate-2 -z-10 shadow-sm" />
              <span className="relative text-charcoal z-10">CONSUME.</span>
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="font-sans text-lg md:text-xl text-charcoal/70 max-w-2xl text-center mb-12 font-medium">
            Modern Pantry prevents food waste and protects your health. Powerful AI extraction meets a radically simple interface to track your pantry's expiry dates automatically.
          </p>
          
          {/* CTA Group */}
          <div className="w-full max-w-md flex justify-center mt-4">
            <Link to="/scan" className="h-16 px-14 flex items-center justify-center bg-golden text-charcoal font-heading text-3xl uppercase rounded-lg hover:bg-[#ebd06b] hover:scale-105 transition-brutal shadow-xl border-2 border-charcoal">
              Try the Demo App
            </Link>
          </div>
          <p className="mt-6 text-sm font-medium text-charcoal/50">Free forever for individuals. No credit card required.</p>
        </div>
      </section>

      {/* 2. PROBLEM-SOLUTION CONTRAST */}
      <section className="w-full flex flex-col lg:flex-row border-b border-charcoal/10">
        {/* Left: The Old Way */}
        <div className="flex-1 bg-charcoal text-white p-12 lg:p-24 flex flex-col justify-start border-r border-sage/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-brutal-grid-dark bg-grid-40 opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-heading text-5xl md:text-7xl uppercase leading-[0.9] mb-8 text-sage">The Old Way</h2>
            <ul className="space-y-6">
              {[
                "Squinting at faded Best-Before dates",
                "Smell-testing questionable milk",
                "Throwing away  Re.50,000 of food yearly",
                "Manual spreadsheets to track inventory"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <X className="w-6 h-6 text-destructive shrink-0 mt-1" />
                  <span className="font-sans text-xl md:text-2xl font-medium text-white/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Right: The Modern Pantry Way */}
        <div className="flex-1 bg-darkGray border-l-8 border-golden p-12 lg:p-24 flex flex-col justify-start relative overflow-hidden">
           <div className="absolute inset-0 bg-brutal-grid-dark bg-grid-40 opacity-40 pointer-events-none" />
           <div className="relative z-10">
            <h2 className="font-heading text-5xl md:text-7xl uppercase leading-[0.9] mb-8 text-white">The Modern Pantry Way</h2>
            <ul className="space-y-6">
              {[
                "One snapshot captures exact dates",
                "Intelligent remaining day algorithms",
                "Save cash by eating before it rots",
                "Zero manual data entry"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-golden shrink-0 mt-1" />
                  <span className="font-sans text-xl md:text-2xl font-medium text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID */}
      <section id="features" className="w-full py-24 md:py-32 px-6 bg-white border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="font-heading text-5xl md:text-7xl uppercase leading-none text-charcoal mb-4">God-Mode <br className="hidden md:block"/> for Groceries</h2>
            <p className="font-sans text-xl text-charcoal/70 max-w-2xl font-medium">Everything you need to stop wasting food, packaged in an aggressively simple interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
            {/* Bento 1: Wide AI OCR */}
            <div className="md:col-span-2 rounded-3xl bg-[#f8f9fa] border-2 border-charcoal/10 p-8 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-2 transition-brutal shadow-sm hover:shadow-2xl">
              <div className="relative z-10 w-2/3">
                <h3 className="font-heading text-4xl uppercase leading-[0.9] mb-4 text-charcoal">Gemini 1.5 <br/> Vision Engine</h3>
                <p className="font-sans text-lg font-medium text-charcoal/70">Our AI reads smudged, crumpled, and weirdly-formatted dates in milliseconds. No typing required.</p>
              </div>
              
              {/* Abstract Mockup UI Snippet */}
              <div className="absolute -bottom-10 -right-10 w-96 h-80 bg-charcoal rounded-xl shadow-2xl border border-charcoal/20 flex flex-col overflow-hidden group-hover:-translate-y-4 group-hover:-translate-x-4 transition-brutal">
                <div className="bg-darkGray h-10 w-full flex items-center px-4 gap-2">
                   <div className="w-3 h-3 rounded-full bg-destructive/80" />
                   <div className="w-3 h-3 rounded-full bg-golden/80" />
                   <div className="w-3 h-3 rounded-full bg-white/40" />
                </div>
                <div className="p-6 font-mono text-sm text-sage/80 space-y-2">
                   <p><span className="text-[#c678dd]">const</span> image <span className="text-[#56b6c2]">=</span> <span className="text-[#e5c07b]">capture</span>()</p>
                   <p><span className="text-[#c678dd]">await</span> <span className="text-[#e5c07b]">gemini</span>.<span className="text-[#61afef]">extractDate</span>(image)</p>
                   <p className="mt-4 border-l-2 border-golden pl-4 text-white">"2025-10-31"</p>
                   <p className="border-l-2 border-destructive pl-4 text-white font-bold">"RISKY"</p>
                </div>
              </div>
            </div>

            {/* Bento 2: Notifications */}
            <div className="rounded-3xl bg-charcoal border-2 border-charcoal p-8 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-2 transition-brutal shadow-sm hover:shadow-2xl">
              <div className="relative z-10">
                <h3 className="font-heading text-4xl uppercase leading-[0.9] mb-4 text-white">Timely <br/><span className="text-golden">Alerts</span></h3>
                <p className="font-sans text-lg font-medium text-sage">Zero stress. We ping you when food is 3 days out from expiring.</p>
              </div>
              <div className="absolute -bottom-8 -right-8">
                <div className="w-32 h-32 bg-golden rounded-full flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(255,225,124,0.3)]">
                  <Zap className="w-12 h-12 text-charcoal" />
                </div>
              </div>
            </div>

            {/* Bento 3: Local First */}
            <div className="rounded-3xl bg-white border-2 border-charcoal/10 p-8 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-2 transition-brutal shadow-sm hover:shadow-2xl">
              <div className="relative z-10">
                <h3 className="font-heading text-4xl uppercase leading-[0.9] mb-4 text-charcoal">Privacy <br/>First</h3>
                <p className="font-sans text-lg font-medium text-charcoal/70">Your kitchen, your data. Local history keeps your pantry secure.</p>
              </div>
               <div className="w-full flex justify-center mt-auto pb-4">
                 <div className="w-16 h-16 border-4 border-charcoal rounded-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-brutal bg-white shadow-[8px_8px_0_#171e19]">
                   <Search className="w-8 h-8 text-charcoal" />
                 </div>
               </div>
            </div>

            {/* Bento 4: Wide Abstract UI Container */}
            <div className="md:col-span-2 rounded-3xl bg-[#f8f9fa] border-2 border-charcoal/10 p-8 overflow-hidden relative flex flex-col group hover:-translate-y-2 transition-brutal shadow-sm hover:shadow-2xl">
               <div className="relative z-20 md:w-1/2 mb-8">
                <h3 className="font-heading text-4xl uppercase leading-[0.9] mb-4 text-charcoal">Intuitive Design</h3>
                <p className="font-sans text-lg font-medium text-charcoal/70">A ridiculously fast, hardware-accelerated interface. Scan 10 items in under a minute without lifting a finger.</p>
              </div>

              {/* Central Abstract Mockup Frame */}
              <div className="absolute top-1/2 -translate-y-1/2 right-0 md:right-10 w-full md:w-[400px] h-[280px] bg-white border border-charcoal/10 shadow-2xl rounded-xl flex flex-col overflow-hidden group-hover:scale-[1.02] transition-brutal">
                {/* Header */}
                <div className="h-8 border-b border-charcoal/10 bg-[#fbfbfb] flex items-center px-3 gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-charcoal/20" />
                   <div className="w-2.5 h-2.5 rounded-full bg-charcoal/20" />
                   <div className="w-2.5 h-2.5 rounded-full bg-charcoal/20" />
                </div>
                {/* Body Canvas */}
                <div className="flex-1 bg-[#fefefe] relative p-6 flex flex-col gap-4">
                  {/* Mock content blocks */}
                  <div className="w-3/4 h-4 rounded-full bg-charcoal/10" />
                  <div className="w-1/2 h-4 rounded-full bg-charcoal/5" />
                  {/* Inner verification card */}
                  <div className="mx-auto mt-4 w-64 p-4 border border-charcoal/10 shadow-lg rounded-xl bg-white flex items-center justify-between">
                     <div className="font-heading text-xl uppercase tracking-wider">SAFE</div>
                     <span className="bg-[#e7f7ed] text-[#128a38] text-xs font-bold px-2 py-1 rounded">24 DAYS</span>
                  </div>
                  {/* Floating Cursor abstract */}
                  <div className="absolute bottom-6 right-12 z-30 transition-brutal group-hover:-translate-y-4 group-hover:-translate-x-2">
                    <MousePointer2 className="w-6 h-6 text-charcoal fill-white drop-shadow-md" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="w-full py-24 md:py-32 px-6 bg-[#f8f9fa] border-b border-charcoal/10 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
           <div className="lg:w-1/3">
             <div className="sticky top-32">
               <h2 className="font-heading text-6xl md:text-8xl uppercase leading-[0.85] text-charcoal mb-6">Workflow<br/>of<br/><span className="text-golden">Champions.</span></h2>
               <p className="font-sans text-xl font-medium text-charcoal/70">Stop guessing. Deploy certainty in three ridiculously easy steps.</p>
             </div>
           </div>

           <div className="lg:w-2/3 flex flex-col gap-24">
             {/* Step 1 */}
             <div className="relative group flex flex-col justify-center min-h-[50vh]">
               <div className="absolute -left-10 md:-left-20 top-1/2 -translate-y-1/2 font-heading text-[200px] md:text-[300px] leading-none text-golden/30 group-hover:text-golden/60 transition-colors pointer-events-none select-none z-0">
                 1
               </div>
               <div className="relative z-10 pl-4 md:pl-20 border-l-4 border-charcoal/10 group-hover:border-golden transition-colors">
                 <h3 className="font-heading text-5xl uppercase leading-[0.9] text-charcoal mb-6">Upload Image</h3>
                 <p className="font-sans text-2xl font-medium text-charcoal/70 max-w-lg">Take a photo using our brutalist camera interface, or drag and drop an existing label scan from your camera roll.</p>
               </div>
             </div>

             {/* Step 2 */}
             <div className="relative group flex flex-col justify-center min-h-[50vh]">
               <div className="absolute -left-10 md:-left-20 top-1/2 -translate-y-1/2 font-heading text-[200px] md:text-[300px] leading-none text-golden/30 group-hover:text-golden/60 transition-colors pointer-events-none select-none z-0">
                 2
               </div>
               <div className="relative z-10 pl-4 md:pl-20 border-l-4 border-charcoal/10 group-hover:border-golden transition-colors">
                 <h3 className="font-heading text-5xl uppercase leading-[0.9] text-charcoal mb-6">Let Gemini Think</h3>
                 <p className="font-sans text-2xl font-medium text-charcoal/70 max-w-lg">Our proxy sends the image to Google's massive GenAI network to reliably extract numeric ISO dates from organic label dirt.</p>
               </div>
             </div>

             {/* Step 3 */}
             <div className="relative group flex flex-col justify-center min-h-[50vh]">
               <div className="absolute -left-10 md:-left-20 top-1/2 -translate-y-1/2 font-heading text-[200px] md:text-[300px] leading-none text-golden/30 group-hover:text-golden/60 transition-colors pointer-events-none select-none z-0">
                 3
               </div>
               <div className="relative z-10 pl-4 md:pl-20 border-l-4 border-charcoal/10 group-hover:border-golden transition-colors">
                 <h3 className="font-heading text-5xl uppercase leading-[0.9] text-charcoal mb-6">Get Verdict</h3>
                 <p className="font-sans text-2xl font-medium text-charcoal/70 max-w-lg">Save the Safe items. Trash the Expired items. Track the Consumables. We give you clear visual badges to make decisions instantly.</p>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="w-full py-24 md:py-32 px-6 bg-white border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-5xl md:text-7xl uppercase leading-none text-center text-charcoal mb-20">Unfiltered <br/> Feedback.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Testimonial 1 */}
             <div className="bg-[#f8f9fa] border border-charcoal/10 p-8 rounded-2xl flex flex-col shadow-sm">
               <div className="flex gap-1 mb-6">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-golden text-golden" />)}
               </div>
               <p className="font-sans text-xl font-medium text-charcoal/80 mb-8 flex-1">"I used to throw away half my fridge. Modern Pantry changed my entire kitchen routine with its brutal efficiency."</p>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-charcoal rounded-full grayscale flex items-center justify-center font-heading text-xl text-white">S</div>
                 <span className="font-heading text-2xl uppercase text-charcoal tracking-wide mt-1">Sarah Jenkins</span>
               </div>
             </div>

             {/* Testimonial 2 (Center Dark) */}
             <div className="bg-charcoal border-2 border-charcoal p-8 rounded-2xl flex flex-col shadow-xl md:-translate-y-4">
               <div className="flex gap-1 mb-6">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-golden text-golden" />)}
               </div>
               <p className="font-sans text-xl font-medium text-white/90 mb-8 flex-1">"The Gemini integration is actually insane. It reads faded grocery store stickers perfectly. The UI is a chef's kiss."</p>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-full grayscale flex items-center justify-center font-heading text-xl text-charcoal">M</div>
                 <span className="font-heading text-2xl uppercase text-golden tracking-wide mt-1">MICHAEL W.</span>
               </div>
             </div>

             {/* Testimonial 3 */}
             <div className="bg-[#f8f9fa] border border-charcoal/10 p-8 rounded-2xl flex flex-col shadow-sm">
               <div className="flex gap-1 mb-6">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-golden text-golden" />)}
               </div>
               <p className="font-sans text-xl font-medium text-charcoal/80 mb-8 flex-1">"No bloated CRM crap. Just scan the label, get the date, save money. Phenomenal app."</p>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-charcoal rounded-full grayscale flex items-center justify-center font-heading text-xl text-white">D</div>
                 <span className="font-heading text-2xl uppercase text-charcoal tracking-wide mt-1">David R.</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="relative w-full py-32 md:py-48 px-6 bg-golden overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Massive Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 mix-blend-multiply overflow-hidden">
          <span className="font-heading text-[30vw] uppercase leading-none text-charcoal whitespace-nowrap">START NOW</span>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="font-heading text-6xl md:text-8xl lg:text-[120px] uppercase leading-[0.85] text-charcoal mb-6">
            Take Control.
          </h2>
          <p className="font-sans text-xl md:text-2xl font-medium text-charcoal/80 mb-12 max-w-xl">
            Join 10,000+ smart kitchens actively stopping food waste today. 
          </p>
          
          <div className="w-full max-w-md bg-white p-4 md:p-6 rounded-2xl shadow-2xl border-4 border-charcoal flex items-center justify-center hover:scale-[1.02] transition-brutal">
            <Link to="/scan" className="w-full h-16 flex items-center justify-center bg-charcoal text-white font-heading text-2xl uppercase rounded-xl hover:bg-darkGray transition-all shadow-md">
              Try The Demo
            </Link>
          </div>
        </div>
      </section>
      
      {/* Mini Footer */}
      <footer className="w-full bg-charcoal text-sage py-8 px-6 border-t border-white/10 text-center flex flex-col md:flex-row items-center justify-between font-sans">
        <p className="font-medium">© 2026 Modern Pantry. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0 font-medium">
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-golden transition-colors">Twitter</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-golden transition-colors">GitHub</a>
          <a href="/privacy" className="hover:text-golden transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
