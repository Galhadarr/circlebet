"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMarket, useResolveMarket, useUpdateMarketImage, useDeleteMarket } from "@/hooks/use-markets";
import { useTradeHistory } from "@/hooks/use-trades";
import { useAuthStore } from "@/stores/auth-store";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import { PriceChart } from "@/components/markets/price-chart";
import { MarketStats } from "@/components/markets/market-stats";
import { TradeHistory } from "@/components/trades/trade-history";
import { TradeModal } from "@/components/trades/trade-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { MarketImageBanner } from "@/components/markets/market-image-banner";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: market, isLoading } = useMarket(id);
  const { data: trades } = useTradeHistory(id);
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const isAdmin = user?.is_admin ?? false;
  const openModal = useTradeModalStore((s) => s.openModal);
  const resolveMarket = useResolveMarket();
  const updateImage = useUpdateMarketImage();
  const deleteMarket = useDeleteMarket();
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!market)
    return <p className="text-text-secondary">Market not found.</p>;

  const isCreator = market.creator_id === userId;
  const canResolve =
    isCreator && (market.status === "CLOSED" || market.status === "OPEN");

  async function handleImageFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMenuOpen(false);
    setUploadingImage(true);
    try {
      const { url } = await api.upload<{ url: string }>("/uploads/image", file);
      await updateImage.mutateAsync({ marketId: id, imageUrl: `${api.baseUrl}${url}` });
      toast.success("Image updated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update image.");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  function handleResolve(outcome: "YES" | "NO") {
    resolveMarket.mutate(
      { marketId: id, outcome },
      {
        onSuccess: () => toast.success(`Market resolved: ${outcome}`),
        onError: (err) => toast.error(err.message),
      }
    );
  }

  function handleDelete() {
    if (!market) return;
    if (!confirm(`Delete "${market.title}"? This cannot be undone.`)) return;
    deleteMarket.mutate(
      { marketId: id, circleId: market.circle_id },
      {
        onSuccess: () => {
          toast.success("Market deleted");
          router.push(`/circle/${market.circle_id}`);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up" style={{ "--delay": "0s" } as React.CSSProperties}>
      {/* Back link */}
      <Link
        href={`/circle/${market.circle_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to circle
      </Link>

      {/* Title + status hero */}
      <div className="relative overflow-hidden bg-surface border border-border rounded-2xl shadow-sm">
        <div className="relative">
          <MarketImageBanner
            imageUrl={market.image_url}
            title={market.title}
            marketId={market.id}
            className="h-52"
          />

          {/* 3-dot edit button — creator only */}
          {isCreator && (
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="w-8 h-8 rounded-full bg-bg-primary/70 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-bg-primary transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  {/* backdrop to close */}
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-10 z-20 w-44 bg-surface border border-border rounded-xl shadow-lg py-1 overflow-hidden">
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary cursor-pointer hover:bg-bg-tertiary hover:text-blue active:bg-bg-tertiary/70 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImage ? (
                        <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      )}
                      {uploadingImage ? "Uploading…" : "Change image"}
                    </button>
                    {market.image_url && (
                      <button
                        onClick={() => {
                          updateImage.mutate({ marketId: id, imageUrl: null });
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red cursor-pointer hover:bg-red/10 active:bg-red/15 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove image
                      </button>
                    )}
                  </div>
                </>
              )}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileSelected}
              />
            </div>
          )}
        </div>
        <div className="p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold leading-snug">{market.title}</h1>
            <Badge
              variant={
                market.status === "OPEN"
                  ? "green"
                  : market.status === "RESOLVED"
                    ? "blue"
                    : "gray"
              }
            >
              {market.status}
            </Badge>
          </div>
          {market.description && (
            <p className="text-sm text-text-secondary mt-1 max-w-lg">
              {market.description}
            </p>
          )}

          {/* Price hero cards */}
          <div className="flex gap-4 mt-6">
            <div className="flex-1 bg-green-dim border border-green/20 rounded-xl p-4 text-center">
              <p className="text-xs text-text-muted font-mono mb-1">YES</p>
              <p className="text-3xl font-bold font-mono text-green">
                {formatPrice(market.price_yes)}
              </p>
            </div>
            <div className="flex-1 bg-red-dim border border-red/20 rounded-xl p-4 text-center">
              <p className="text-xs text-text-muted font-mono mb-1">NO</p>
              <p className="text-3xl font-bold font-mono text-red">
                {formatPrice(market.price_no)}
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Trade buttons */}
      {market.status === "OPEN" && (
        <div className="flex gap-4">
          <Button
            variant="green"
            size="lg"
            className="flex-1 rounded-xl py-4 text-base"
            onClick={() => openModal(market.id, "YES")}
          >
            Buy Yes
          </Button>
          <Button
            variant="red"
            size="lg"
            className="flex-1 rounded-xl py-4 text-base"
            onClick={() => openModal(market.id, "NO")}
          >
            Buy No
          </Button>
        </div>
      )}

      {/* Resolve */}
      {canResolve && (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-sm font-medium">Resolve this market</p>
          <div className="flex gap-3">
            <Button
              variant="green"
              onClick={() => handleResolve("YES")}
              loading={resolveMarket.isPending}
            >
              Resolve YES
            </Button>
            <Button
              variant="red"
              onClick={() => handleResolve("NO")}
              loading={resolveMarket.isPending}
            >
              Resolve NO
            </Button>
          </div>
        </div>
      )}

      {/* Admin: delete market */}
      {isAdmin && (
        <div className="bg-surface border border-red/20 rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-sm font-medium text-red">Admin actions</p>
          <Button
            variant="red"
            onClick={handleDelete}
            loading={deleteMarket.isPending}
          >
            Delete market
          </Button>
        </div>
      )}

      {/* Stats */}
      <MarketStats market={market} />

      {/* Chart */}
      <div
        className="bg-surface border border-border rounded-2xl p-5 shadow-sm animate-fade-in-up"
        style={{ "--delay": "0.1s" } as React.CSSProperties}
      >
        <h2 className="font-semibold mb-4">Price History</h2>
        <PriceChart
          trades={trades ?? []}
          currentPriceYes={market.price_yes}
        />
      </div>

      {/* Trade history */}
      <div
        className="animate-fade-in-up"
        style={{ "--delay": "0.15s" } as React.CSSProperties}
      >
        <h2 className="font-semibold mb-4">Recent Trades</h2>
        <TradeHistory trades={trades ?? []} />
      </div>

      <TradeModal />
    </div>
  );
}
