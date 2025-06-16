interface Props {
  errorMessage?: string;
}
export default function Error({
  errorMessage = "에러가 발생하였습니다",
}: Props) {
  return (
    <div className="p-8 text-center text-red-600 font-semibold">
      {errorMessage}
    </div>
  );
}
